/**
 * LLM Service
 * Supports Ollama (local) and external API providers
 * Compatible with Phi-3 Mini and other SLMs
 */

import type { LLMConfig, LLMRequest, LLMResponse } from '../types/ai.js';
import { DEFAULT_LLM_CONFIG } from '../config/ai.config.js';

export class LLMService {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = { ...DEFAULT_LLM_CONFIG, ...config };
  }

  /**
   * Generate completion using configured LLM provider
   */
  async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
    const config = { ...this.config, ...request.config };
    
    switch (config.provider) {
      case 'ollama':
        return this.generateWithOllama(request, config);
      case 'api':
        return this.generateWithAPI(request, config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  /**
   * Generate completion using Ollama (local or remote instance)
   */
  private async generateWithOllama(
    request: LLMRequest,
    config: LLMConfig
  ): Promise<LLMResponse> {
    const model = config.model || 'phi3:mini';
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate`;

    const payload = {
      model,
      prompt: request.systemPrompt 
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt,
      stream: false,
      options: {
        temperature: config.temperature || 0.7,
        num_predict: config.maxTokens || 2000,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Ollama returns the response in 'response' field and includes context
      return {
        content: data.response || '',
        model: data.model || model,
        usage: {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Ollama request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate completion using external API (OpenAI-compatible or custom)
   */
  private async generateWithAPI(
    request: LLMRequest,
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!config.apiKey) {
      throw new Error('API key is required for external API provider');
    }

    const model = config.model || 'phi3-mini';
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl}/chat/completions`;

    const messages = [
      ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
      { role: 'user', content: request.prompt },
    ];

    const payload = {
      model,
      messages,
      temperature: config.temperature || 0.7,
      max_tokens: config.maxTokens || 2000,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        content: choice?.message?.content || '',
        model: data.model || model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Stream completion (for real-time responses)
   * Returns async generator for streaming tokens
   */
  async *streamCompletion(
    request: LLMRequest
  ): AsyncGenerator<string, void, unknown> {
    const config = { ...this.config, ...request.config };
    
    // For now, only support streaming with Ollama
    if (config.provider !== 'ollama') {
      // Fallback to non-streaming for API provider
      const result = await this.generateCompletion(request);
      yield result.content;
      return;
    }

    const model = config.model || 'phi3:mini';
    const baseUrl = config.baseUrl || 'http://localhost:11434';
    const url = `${baseUrl}/api/generate`;

    const payload = {
      model,
      prompt: request.systemPrompt 
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt,
      stream: true,
      options: {
        temperature: config.temperature || 0.7,
        num_predict: config.maxTokens || 2000,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ollama streaming error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.response) {
            yield data.response;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

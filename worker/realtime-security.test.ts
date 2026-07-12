import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasRealtimeCapacity,
  isAllowedWebSocketOrigin,
  MAX_CONNECTIONS_PER_IP,
  MAX_CONNECTIONS_PER_ROOM,
} from './realtime-security';

describe('realtime security', () => {
  it('accepts only the request origin', () => {
    const requestUrl = new URL('https://versus.space/api/realtime/polls/123');
    assert.equal(isAllowedWebSocketOrigin(requestUrl, 'https://versus.space'), true);
    assert.equal(isAllowedWebSocketOrigin(requestUrl, 'https://attacker.example'), false);
    assert.equal(isAllowedWebSocketOrigin(requestUrl, null), false);
    assert.equal(isAllowedWebSocketOrigin(requestUrl, 'not a URL'), false);
    assert.equal(
      isAllowedWebSocketOrigin(
        new URL('http://127.0.0.1:8787/api/realtime/polls/123'),
        'http://localhost:5173'
      ),
      true
    );
  });

  it('caps connections from one client IP', () => {
    assert.equal(
      hasRealtimeCapacity(Array(MAX_CONNECTIONS_PER_IP).fill('203.0.113.1'), '203.0.113.1'),
      false
    );
    assert.equal(
      hasRealtimeCapacity(Array(MAX_CONNECTIONS_PER_IP).fill('203.0.113.1'), '203.0.113.2'),
      true
    );
  });

  it('caps total room connections', () => {
    assert.equal(
      hasRealtimeCapacity(
        Array.from({ length: MAX_CONNECTIONS_PER_ROOM }, (_, index) => `203.0.113.${index}`),
        '198.51.100.1'
      ),
      false
    );
  });
});

import asyncio
import pytest
from backend.services.gemini_service import GeminiService

@pytest.mark.asyncio
async def test_sse_stream_generator_cleanup():
    service = GeminiService()
    chunks = []
    
    # Test normal iteration
    async for chunk in service.stream_gemini_response("Test SSE prompt"):
        chunks.append(chunk)
        if len(chunks) >= 3:
            break

    assert len(chunks) >= 3
    assert all(c.startswith("data: ") for c in chunks)

@pytest.mark.asyncio
async def test_sse_stream_generator_cancellation_handling():
    service = GeminiService()
    generator = service.stream_gemini_response("Test cancellation prompt")
    
    # Obtain first chunk
    first_chunk = await anext(generator)
    assert first_chunk.startswith("data: ")
    
    # Close generator explicitly to simulate client disconnect / task cancellation
    await generator.aclose()

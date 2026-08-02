import { formatTimelineDate, getTimeZoneAbbr, formatFullTimestamp } from './dateUtils.js';
import assert from 'assert';

console.log('Running dateUtils unit tests...');

// Set specific timezone for execution to ensure tests are deterministic
process.env.TZ = 'UTC';

// 1. Test empty dateStr (should default gracefully to current time)
{
    const before = new Date().getTime();
    const result = formatTimelineDate(null);
    const after = new Date().getTime();
    console.log('Result for null:', result);
    assert.ok(result, 'Result for null should not be empty');
    assert.strictEqual(typeof result, 'string');
}

// 2. Test corrupt dateStr (should default gracefully to current time)
{
    const result = formatTimelineDate('this-is-not-a-date');
    console.log('Result for corrupt date:', result);
    assert.ok(result, 'Result for corrupt date should not be empty');
    assert.strictEqual(typeof result, 'string');
}

// 3. Test Safari parser normalization (space instead of T)
{
    // "2026-06-04 02:49:00" -> UTC since no timezone or Z
    const safariStr = '2026-06-04 02:49:00';
    const result = formatTimelineDate(safariStr);
    console.log('Result for Safari date string:', result);
    // Since we forced TZ=UTC for node process, result should represent 2026-06-04 02:49:00 UTC
    // formatted locally (which is now UTC)
    // Date.toLocaleString in UTC should format to "04 Jun 2026, 02:49 am" or similar depending on node environment
    assert.ok(result.includes('04'), 'Should include day 04');
    assert.ok(result.includes('Jun'), 'Should include month Jun');
    assert.ok(result.includes('2026'), 'Should include year 2026');
}

// 4. Test different timezone configurations using process.env.TZ
{
    const dateStr = '2026-06-04T02:49:00Z';
    
    // Test in UTC
    process.env.TZ = 'UTC';
    const resultUTC = formatTimelineDate(dateStr);
    console.log('Result in UTC:', resultUTC);
    
    // Test in New York (EDT/EST) - UTC-4/5
    process.env.TZ = 'America/New_York';
    const resultNY = formatTimelineDate(dateStr);
    console.log('Result in New York:', resultNY);
    
    // Test in Tokyo (JST) - UTC+9
    process.env.TZ = 'Asia/Tokyo';
    const resultTokyo = formatTimelineDate(dateStr);
    console.log('Result in Tokyo:', resultTokyo);

    // Assert that the formatted output changes depending on timezone setting
    assert.notStrictEqual(resultNY, resultTokyo, 'Formatted date should vary by timezone');
}

console.log('All dateUtils tests passed successfully!');

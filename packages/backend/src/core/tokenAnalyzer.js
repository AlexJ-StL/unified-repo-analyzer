/**
 * Token counting and text sampling utilities
 */
/**
 * Simple token counting function
 * This is a basic approximation - actual LLM tokenization is more complex
 *
 * @param text - Text to count tokens for
 * @returns Approximate token count
 */
export function countTokens(text) {
    if (!text)
        return 0;
    // Simple approximation: split by whitespace and punctuation
    // This is a rough estimate - actual tokenizers are more sophisticated
    const tokens = text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ');
    return tokens.length;
}
/**
 * Samples text to fit within token limits
 *
 * @param text - Text to sample
 * @param maxTokens - Maximum number of tokens
 * @param strategy - Sampling strategy
 * @returns Sampled text
 */
export function sampleText(text, maxTokens, strategy = 'smart') {
    if (!text)
        return '';
    const tokenCount = countTokens(text);
    // If text is already within limits, return as is
    if (tokenCount <= maxTokens) {
        return text;
    }
    // Split text into lines
    const lines = text.split('\n');
    switch (strategy) {
        case 'start':
            // Take from the beginning
            return sampleLines(lines, maxTokens, 'start');
        case 'end':
            // Take from the end
            return sampleLines(lines, maxTokens, 'end');
        case 'middle':
            // Take from the middle
            return sampleLines(lines, maxTokens, 'middle');
        case 'smart':
        default:
            // Smart sampling: prioritize important parts
            return smartSample(text, maxTokens);
    }
}
/**
 * Samples lines from text based on position
 *
 * @param lines - Array of text lines
 * @param maxTokens - Maximum number of tokens
 * @param position - Position to sample from
 * @returns Sampled text
 */
function sampleLines(lines, maxTokens, position) {
    let result = [];
    let currentTokens = 0;
    if (position === 'start') {
        // Take lines from the beginning
        for (const line of lines) {
            const lineTokens = countTokens(line);
            if (currentTokens + lineTokens <= maxTokens) {
                result.push(line);
                currentTokens += lineTokens;
            }
            else {
                break;
            }
        }
        return result.join('\n') + (result.length < lines.length ? '\n... (truncated)' : '');
    }
    else if (position === 'end') {
        // Take lines from the end
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            const lineTokens = countTokens(line);
            if (currentTokens + lineTokens <= maxTokens) {
                result.unshift(line);
                currentTokens += lineTokens;
            }
            else {
                break;
            }
        }
        return (result.length < lines.length ? '... (truncated)\n' : '') + result.join('\n');
    }
    else {
        // Take lines from the middle
        const middleIndex = Math.floor(lines.length / 2);
        let leftIndex = middleIndex;
        let rightIndex = middleIndex;
        // Add the middle line first
        const middleLine = lines[middleIndex];
        const middleTokens = countTokens(middleLine);
        if (middleTokens <= maxTokens) {
            result.push(middleLine);
            currentTokens += middleTokens;
            // Expand outward from the middle
            leftIndex--;
            rightIndex++;
            while (leftIndex >= 0 || rightIndex < lines.length) {
                // Try to add a line from the right
                if (rightIndex < lines.length) {
                    const rightLine = lines[rightIndex];
                    const rightTokens = countTokens(rightLine);
                    if (currentTokens + rightTokens <= maxTokens) {
                        result.push(rightLine);
                        currentTokens += rightTokens;
                        rightIndex++;
                    }
                }
                // Try to add a line from the left
                if (leftIndex >= 0) {
                    const leftLine = lines[leftIndex];
                    const leftTokens = countTokens(leftLine);
                    if (currentTokens + leftTokens <= maxTokens) {
                        result.unshift(leftLine);
                        currentTokens += leftTokens;
                        leftIndex--;
                    }
                }
                // If we can't add any more lines, break
                if ((leftIndex < 0 || currentTokens + countTokens(lines[leftIndex]) > maxTokens) &&
                    (rightIndex >= lines.length || currentTokens + countTokens(lines[rightIndex]) > maxTokens)) {
                    break;
                }
            }
        }
        return ((leftIndex >= 0 ? '... (truncated)\n' : '') +
            result.join('\n') +
            (rightIndex < lines.length ? '\n... (truncated)' : ''));
    }
}
/**
 * Smart sampling that prioritizes important parts of the text
 *
 * @param text - Text to sample
 * @param maxTokens - Maximum number of tokens
 * @returns Sampled text
 */
function smartSample(text, maxTokens) {
    // Split text into sections
    const lines = text.split('\n');
    // Identify important sections
    const importantSections = [];
    // Look for patterns indicating important sections
    let inImportantSection = false;
    let sectionStart = 0;
    let sectionImportance = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Check for section headers, function definitions, class definitions, etc.
        const isImportant = /^#+ /.test(line) || // Markdown header
            /^(function|class|def|interface|import|export) /.test(line) || // Code definition
            /^(public|private|protected) /.test(line) || // Access modifier
            /^(\/\*\*|\*\/)/.test(line) || // JSDoc comment
            /^\/\/ [A-Z]/.test(line) || // Comment starting with capital letter
            /TODO|FIXME|NOTE|HACK|XXX/.test(line); // Special comment markers
        if (isImportant && !inImportantSection) {
            // Start of important section
            inImportantSection = true;
            sectionStart = i;
            // Calculate importance based on patterns
            sectionImportance = /^# /.test(line)
                ? 10 // Top-level header
                : /^## /.test(line)
                    ? 8 // Second-level header
                    : /^### /.test(line)
                        ? 6 // Third-level header
                        : /^(function|class|def|interface) /.test(line)
                            ? 9 // Code definition
                            : /^(import|export) /.test(line)
                                ? 7 // Import/export
                                : /TODO|FIXME/.test(line)
                                    ? 8 // Important comment
                                    : 5; // Other important line
        }
        else if ((line === '' || i === lines.length - 1) && inImportantSection) {
            // End of important section
            inImportantSection = false;
            // Add section to important sections
            importantSections.push({
                start: sectionStart,
                end: i,
                importance: sectionImportance,
            });
        }
    }
    // If no important sections found, fall back to start sampling
    if (importantSections.length === 0) {
        return sampleLines(lines, maxTokens, 'start');
    }
    // Sort sections by importance
    importantSections.sort((a, b) => b.importance - a.importance);
    // Take sections until we reach the token limit
    const selectedLines = [];
    let currentTokens = 0;
    for (const section of importantSections) {
        const sectionLines = lines.slice(section.start, section.end + 1);
        const sectionText = sectionLines.join('\n');
        const sectionTokens = countTokens(sectionText);
        if (currentTokens + sectionTokens <= maxTokens) {
            // Add the entire section
            selectedLines.push(...sectionLines);
            currentTokens += sectionTokens;
        }
        else {
            // If the section is too large, sample it
            const remainingTokens = maxTokens - currentTokens;
            if (remainingTokens > 0) {
                const sampledSection = sampleLines(sectionLines, remainingTokens, 'start');
                selectedLines.push(...sampledSection.split('\n').filter((line) => line !== '... (truncated)'));
            }
            break;
        }
    }
    // Sort lines by their original position
    const lineIndices = selectedLines.map((line) => lines.indexOf(line));
    lineIndices.sort((a, b) => a - b);
    // Reconstruct text in original order
    const result = [];
    let lastIndex = -1;
    for (const index of lineIndices) {
        if (index === -1)
            continue; // Skip lines not found in original text
        // Add ellipsis for gaps
        if (lastIndex !== -1 && index > lastIndex + 1) {
            result.push('... (truncated)');
        }
        result.push(lines[index]);
        lastIndex = index;
    }
    return result.join('\n');
}
//# sourceMappingURL=tokenAnalyzer.js.map
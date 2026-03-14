export interface DocTemplate {
  name: string;
  description: string;
  content: string;
}

export const docTemplates: DocTemplate[] = [
  {
    name: "Tutorial",
    description: "Step-by-step guide with prerequisites and code examples",
    content: `# Tutorial Title

## Prerequisites

- Requirement 1
- Requirement 2

## Step 1: Getting Started

Description of the first step.

\`\`\`bash
# Command to run
npm install example
\`\`\`

## Step 2: Configuration

Description of the second step.

\`\`\`json
{
  "key": "value"
}
\`\`\`

## Step 3: Implementation

Description of implementation.

\`\`\`typescript
// Your code here
\`\`\`

## Summary

What you learned in this tutorial.

## Next Steps

- Link to related doc 1
- Link to related doc 2
`,
  },
  {
    name: "API Endpoint",
    description: "REST API endpoint documentation with request/response",
    content: `# Endpoint Name

\`\`\`http
GET /api/v1/resource
\`\`\`

## Description

Brief description of what this endpoint does.

## Authentication

Requires \`Bearer\` token in the \`Authorization\` header.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | string | Yes | Resource identifier |
| \`limit\` | number | No | Max results (default: 20) |

## Request

\`\`\`bash
curl -X GET "https://api.example.com/v1/resource?limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

## Response

\`\`\`json
{
  "data": [],
  "pagination": {
    "page": 1,
    "total": 42
  }
}
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
`,
  },
  {
    name: "Changelog Entry",
    description: "Release notes with added/changed/fixed sections",
    content: `# v1.0.0 — Release Title

**Released:** ${new Date().toISOString().split("T")[0]}

## ✨ Added

- New feature 1
- New feature 2

## 🔄 Changed

- Improved behavior of X
- Updated dependency Y

## 🐛 Fixed

- Fixed issue with Z
- Resolved edge case in W

## 💥 Breaking Changes

- API endpoint \`/old\` renamed to \`/new\`

## Migration Guide

Steps to upgrade from the previous version.
`,
  },
  {
    name: "Troubleshooting",
    description: "Common issues with symptoms and solutions",
    content: `# Troubleshooting: Topic

## Common Issues

### Issue 1: Error Message

**Symptoms:**
- What the user sees

**Cause:**
Brief explanation of why this happens.

**Solution:**

\`\`\`bash
# Fix command
\`\`\`

---

### Issue 2: Unexpected Behavior

**Symptoms:**
- What the user experiences

**Cause:**
Brief explanation.

**Solution:**

1. Step one
2. Step two
3. Step three

---

## Still Having Issues?

- Check the [FAQ](/docs/faq)
- [Open an issue](https://github.com/your-repo/issues)
`,
  },
];

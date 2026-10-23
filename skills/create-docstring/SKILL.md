---
name: create-docstring
description: Create or update function docstrings or equivalent function documentation when behavior, inputs, outputs, or language-specific details still need explanation despite clear names and structure. Use while creating or changing functions, or when asked to document them. Adjust detail to the user's language familiarity.
---

# Create docstring

Simplify confusing functions first; do not use docstrings to excuse bad code. Do not document every function. Skip obvious getters, wrappers, or helpers when documentation would only repeat their names and types.

## When useful

Document details a caller could otherwise misunderstand: input meaning or constraints, units, tensor shapes, output meaning, edge cases, mutation, ownership, concurrency, or errors. Include only the details relevant to that function.

Read the user's language preferences in the active AGENTS.md instructions. For less familiar languages, lower the threshold for documentation and explain relevant language-specific behavior. For familiar languages, document only behavior that still needs explanation. Do not turn extra detail into line-by-line narration. If no preference is given, use the selective rule above.

## Format

Describe what the function does, its inputs, and its output. Do not repeat what names and types already make clear.

- Python: use a short behavior summary and Google-style `Args:` and `Returns:` sections when useful, following PEP 257 conventions. Omit unnecessary sections.
- JavaScript/TypeScript: follow the repository's JSDoc or TSDoc style.
- Rust: use `///` documentation comments.
- Go: use a documentation comment beginning with the function's name.
- C/C++: follow the repository's documentation style, such as Doxygen.
- Other languages: follow the repository's native function-documentation style.

For example, `masked_softmax` converts selected tensor values into probabilities. Its docstring clarifies which mask values are included and what happens when everything is excluded—choices the function's name does not explain.

```python
from torch import Tensor

def masked_softmax(logits: Tensor, mask: Tensor, dim: int = -1) -> Tensor:
    """
    Compute softmax over the included values.

    Args:
        logits: Finite floating-point tensor.
        mask: Boolean tensor matching logits; True includes a value.
        dim: Dimension along which to normalize.

    Returns:
        Tensor with the same shape as logits. Excluded values are zero.
        Slices with no included values return all zeros, not NaN.
    """
    masked_logits = logits.masked_fill(~mask, float("-inf"))
    empty = ~mask.any(dim=dim, keepdim=True)
    safe_logits = masked_logits.masked_fill(empty, 0)
    return safe_logits.softmax(dim=dim).masked_fill(~mask, 0)
```

## Scope

Inspect the function, callers, and existing tests before describing behavior. Do not invent guarantees or claim validation that did not happen. Report unclear behavior or needed simplification instead of guessing.

Edit only function documentation. Do not change runtime behavior, add tests or dependencies, access credentials, or publish changes without separate authorization.

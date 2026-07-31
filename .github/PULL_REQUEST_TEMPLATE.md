## Description
Brief description of what this PR does and why.

Closes #

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring (no functional change)
- [ ] Documentation update
- [ ] CI/CD update
- [ ] New detection signal/algorithm

## Checklist

### Backend
- [ ] Backend unit tests pass: `python -m pytest backend/tests/test_frequency_analysis.py backend/tests/test_gradcam.py -v`
- [ ] No ruff lint errors: `ruff check backend/ --select E,W,F,I --ignore E501`
- [ ] New endpoints have Pydantic v2 schemas in `schemas.py`
- [ ] New detection signals have corresponding tests in `backend/tests/`

### Frontend
- [ ] `npm run lint` passes (oxlint)
- [ ] `npm run build` succeeds
- [ ] New components have unique `id` attributes for testability
- [ ] Mobile responsive (test at 375px)

### Documentation
- [ ] README updated if API response format changed
- [ ] CHANGELOG.md updated
- [ ] Docstrings added to new functions

## Screenshots (for UI changes)
<!-- Paste before/after screenshots if applicable -->

## API Changes (if applicable)
<!-- Document any new/changed response fields -->
```json
{
  "new_field": "..."
}
```

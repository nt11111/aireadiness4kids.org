# Site data (edit by hand)

These files feed the home page. Anything empty stays hidden, so the site never shows placeholders.

## partners.json
Partners shown in the credibility strip on the home page. Only add a partner who has agreed to be listed.

```json
[
  { "name": "UYS Academy", "url": "https://example.org", "logo": "/brand/partners/uys-academy.svg" }
]
```

- `name` is required. `url` and `logo` are optional; without a logo the name is shown as text.
- Put logo files in `public/brand/partners/`. The build fails if a listed logo file doesn't exist.

## impact.json
Impact numbers on the home page (lessons completed, learners reached). Only real, counted numbers.

```json
{
  "stats": [
    { "label": "Learners reached", "value": "1,200", "as_of": "2026-12-01" }
  ]
}
```

- `as_of` is the date the number was counted and is shown next to the figures.

Reviewer names come from each module's `reviewers` field (in `src/content/modules/`), not from this folder.

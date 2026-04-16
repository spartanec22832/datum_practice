# Backend Plan

## Roles

- Anonymous user: can read only published projects, sections, and cards.
- Authenticated user: can create sections and cards, and can edit or delete only their own materials.
- Admin: full CRUD for projects, sections, cards, media, and links.

## Core entities

- `Project`: official company project card with GeoJSON geometry.
- `Section`: knowledge base section with nested parent/child hierarchy.
- `Card`: knowledge base material attached to a section.
- `CardMedia`: optional media item for a card.
- `ExternalLink`: optional external link for a card.

## Relations

- `Section.parent -> Section`
- `Section.author -> User`
- `Card.section -> Section`
- `Card.author -> User`
- `CardMedia.card -> Card`
- `ExternalLink.card -> Card`

## API before frontend

### Auth

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

### Projects

- `GET /api/projects/`
- `GET /api/projects/<slug>/`
- `POST /api/projects/`
- `PUT/PATCH /api/projects/<id>/`
- `DELETE /api/projects/<id>/`

### Sections

- `GET /api/sections/`
- `GET /api/sections/<slug>/`
- `GET /api/sections/<slug>/content/`
- `POST /api/sections/`
- `PUT/PATCH /api/sections/<id>/`
- `DELETE /api/sections/<id>/`

### Cards

- `GET /api/cards/`
- `GET /api/cards/<slug>/`
- `POST /api/cards/`
- `PUT/PATCH /api/cards/<id>/`
- `DELETE /api/cards/<id>/`

## Access rules

- Projects:
  - read: everyone can read published records
  - create/update/delete: admin only
- Sections and cards:
  - read: anonymous users can read published records, authenticated users can also read their own drafts, admins can read everything
  - create: authenticated users and admins
  - update/delete: author or admin

# MVP Text-to-Image Search Requirements

## Overview
A minimal viable product for automotive text-to-image search using 100 pre-processed images with automatic metadata extraction, automatic tag generation, and
simple keyword-based search.

## Technical Stack
- Frontend: Next.js (React)
- Backend: Node.js with Express
- Image Storage: Local filesystem (MVP only)
- Database: SQLite (for metadata)
- AI Model: OpenAI CLIP via Hugging Face Transformers

## Core Features

### 1. Image Upload & Processing
- Upload 100 automotive images via admin interface
- Automatic metadata extraction (filename, size, format)
- Generate CLIP embeddings for each image
- Store embeddings with metadata

### 2. Text-to-Image Search
- Simple search input field
- Natural language queries are converted into keywords
- Keywords are matched against stored tags
- Return top 10 matching images
- Display results with similarity scores
- Click to view full-size images

### 3. Basic Tagging System
- Automatic and Manual tag assignment during upload
- Predefined tag categories:
    - Color: red, blue, white, black, silver, etc.
    - Type: sedan, SUV, truck, convertible, hatchback
    - Features: sunroof, leather, alloy wheels, spoiler
    - Brand: Toyota, Honda, BMW, Ford, etc.

## System Requirements

### Performance Targets
- Search response time: < 2 seconds
- Support 10 concurrent users
- 100 images maximum
- Basic error handling

### Functional Requirements
- Upload images with drag-and-drop
- Tag images during upload process
- Search with natural language
- View search results in grid layout
- Click to enlarge images
- Basic admin panel for image management

## Architecture

### Frontend (Next.js)
```
pages/
├── index.js # Search interface
├── admin.js # Upload and tag images
└── api/
├── search.js # Search endpoint
├── upload.js # Image upload
└── images.js # Image metadata
```

### Backend (Node.js)
```
src/
├── app.js # Express server
├── routes/
│ ├── search.js # Search logic
│ ├── upload.js # Image processing
│ └── images.js # Image metadata
├── services/
│ ├── clipService.js # CLIP embedding generation
│ ├── tagService.js # Automatic tag extraction
│ └── imageService.js # Image processing
└── models/
└── Image.js # Image metadata model
```

## Success Criteria
- Successfully upload and tag 100 automotive images
- Search returns relevant results in under 2 seconds
- Natural language queries work (e.g., "luxury red car")
- Basic admin interface functional
- System handles 10 concurrent users without errors

## Limitations & Future Enhancements
- No user authentication (single user system)
- Local file storage only
- Basic tagging system
- No image-to-image search
- No advanced filtering
- No deployment considerations
- Limited to 100 images
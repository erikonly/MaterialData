# Materials Database Platform

A comprehensive materials science database platform with modern web interface, analytics dashboard, and AI-powered conversational assistant for R&D teams.

## Features

### 🗄️ Comprehensive Database
- Detailed material composition data
- Thermal processing parameters
- Mechanical properties and test conditions
- Microstructure information
- Publication references and traceability

### 📊 Analytics Dashboard
- Interactive data visualizations
- Element distribution analysis
- Strength and property correlations
- Publication trends over time
- Thermal processing statistics
- **Drill-down capabilities** for detailed data exploration
- **Click-to-explore** chart interactions

### 🤖 AI Assistant
- Natural language queries in English and Chinese
- Intelligent analysis of material properties
- Heat treatment optimization suggestions
- Composition-property relationships
- Microstructure correlation insights
- **Complete data references** for every answer
- **Clickable links** to source materials and publications

### 🔍 Advanced Search & Comparison
- Multi-criteria filtering
- Composition-based search
- Property range queries
- Publication year filtering
- Full-text search capabilities
- **Side-by-side material comparison** (up to 5 materials)
- **Interactive comparison charts** and tables

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data storage
- **RESTful API** design
- **Security middleware** (Helmet, CORS, Rate limiting)

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication

### Key Libraries
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Headless UI** for accessible components

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd materials-database-platform
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Set MongoDB URI, API keys, etc.
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Server: npm run server
   # Client: npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Materials
- `GET /api/materials` - Get paginated materials list
- `GET /api/materials/:id` - Get specific material details
- `GET /api/materials/composition/:element` - Filter by element
- `GET /api/materials/stats/overview` - Get database statistics

### Search
- `POST /api/search` - Basic search functionality
- `POST /api/search/advanced` - Advanced multi-criteria search

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant
- `GET /api/ai/suggestions` - Get suggested questions

## Sample Data Structure

```json
{
  "ref": "Springer/10853",
  "doi": "10.1007/s10853-007-1963-5",
  "title": "Effect of copper additions in directly quenched titanium–boron steels",
  "publish_year": "2007",
  "sample_id": "10.1007-s10853-007-1963-5_1",
  "composition_content": [
    {"element": "C", "content": "0.04%"},
    {"element": "Mn", "content": "1.60%"}
  ],
  "thermal_process": [{
    "temperature": "750 °C",
    "cooling_method": "water-quenching"
  }],
  "tensile_properties": {
    "yield_strength": "850 MPa",
    "ultimate_strength": "1200 MPa",
    "elongation": "12%"
  },
  "microstructure": {
    "phase_fraction": [
      {"phase_name": "ferrite", "phase_content": "60%"},
      {"phase_name": "martensite", "phase_content": "40%"}
    ]
  }
}
```

## AI Assistant Capabilities

The AI assistant can help with:

### Heat Treatment Analysis
- Temperature-time-cooling relationships
- Optimal processing parameters
- Phase transformation predictions

### Composition Effects
- Element influence on properties
- Alloy design recommendations
- Multi-element interactions

### Property Correlations
- Strength-ductility relationships
- Microstructure-property links
- Processing-performance connections

### Example Queries
- "How does carbon content affect yield strength in steels?"
- "What's the optimal heat treatment for maraging steel?"
- "Compare elongation in martensitic vs ferritic structures"
- "不同热处理条件下的屈服强度差异分析" (Chinese supported)

## Deployment

### Production Build
```bash
# Build client for production
cd client
npm run build

# Start production server
cd ..
NODE_ENV=production npm start
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd client && npm ci && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Data Sources

All materials data is sourced from peer-reviewed scientific publications with full traceability:
- Journal references and DOI links
- Publication dates and authors
- Experimental methodology details
- Quality assurance protocols

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## Roadmap

### Upcoming Features
- [ ] Machine learning property predictions
- [ ] Advanced statistical analysis tools
- [ ] Export to common formats (CSV, Excel, JSON)
- [ ] User authentication and saved searches
- [ ] API rate limiting and usage analytics
- [ ] Mobile-responsive design improvements
- [ ] Multi-language interface support

### Data Expansion
- [ ] Additional material systems (ceramics, polymers)
- [ ] More processing techniques (additive manufacturing)
- [ ] Environmental and sustainability metrics
- [ ] Cost and availability data integration
## 🆕 Enh
anced Features

### Material Comparison System
- **Multi-select interface** - Select up to 5 materials for comparison
- **Interactive comparison charts** - Bar charts for composition, radar charts for properties
- **Tabbed comparison view** - Composition, Properties, and Thermal Processing tabs
- **Export functionality** - Download comparison results

### Dashboard Drill-Down Analytics
- **Click-to-explore** - Click any chart element (bars, pie segments, line points) to drill down
- **Detailed material listings** - See all materials in each category
- **Advanced filtering** - Search and sort within drill-down results
- **Reference tracking** - Complete publication information for each material

### AI Assistant with Data Provenance
- **Source references** - Every AI response includes relevant data sources
- **Clickable links** - Direct navigation to material details and external publications
- **DOI integration** - Links to original research papers
- **Relevance indicators** - Shows why each reference is relevant to the query

These enhancements provide complete data traceability and interactive exploration capabilities, making the platform ideal for serious R&D work while maintaining ease of use.
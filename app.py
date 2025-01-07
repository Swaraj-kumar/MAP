from flask import Flask, render_template, jsonify, send_from_directory
import pandas as pd
import os
from app import app


app = Flask(__name__)

def load_plant_data():
    """Load and process the Excel data"""
    try:
        df = pd.read_excel('data.xlsx')
        # Clean up the data
        df = df.fillna('')
        # Convert all column names to strings and clean them
        df.columns = df.columns.astype(str).str.strip()
        
        # Group by state and convert to a structured dictionary
        plants_by_state = {}
        for state, group in df.groupby('State'):
            state = str(state).strip()
            if state:  # Only include non-empty states
                plants_by_state[state] = [
                    {k.strip(): str(v).strip() if isinstance(v, str) else v 
                     for k, v in row.items()}
                    for _, row in group.iterrows()
                ]
        return plants_by_state
    except Exception as e:
        print(f"Error loading Excel data: {str(e)}")
        return {}

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/plants')
def get_plants():
    """Return plant data as JSON"""
    try:
        plants_by_state = load_plant_data()
        # Print for debugging
        print("Loaded plants by state:", {k: len(v) for k, v in plants_by_state.items()})
        return jsonify(plants_by_state)
    except Exception as e:
        print(f"Error in get_plants: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/static/geojson/<path:filename>')
def serve_geojson(filename):
    """Serve GeoJSON files"""
    return send_from_directory('static/geojson', filename)

if __name__ == '__main__':
    app.debug = True
    app.run()
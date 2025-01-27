from flask import Flask, render_template, jsonify, request, send_from_directory
import pandas as pd


app = Flask(__name__)

def load_plant_data():
    """Load and process the plant data from data.xlsx"""
    try:
        df = pd.read_excel('data.xlsx')
        df = df.fillna('')
        df.columns = df.columns.astype(str).str.strip()
        
        plants_by_state = {}
        for state, group in df.groupby('State'):
            state = str(state).strip()
            if state:
                plants_by_state[state] = [
                    {k.strip(): str(v).strip() if isinstance(v, str) else v 
                     for k, v in row.items()}
                    for _, row in group.iterrows()
                ]
        return plants_by_state
    except Exception as e:
        print(f"Error loading plant data: {str(e)}")
        return {}

def load_biomass_data():
    """Load and process the biomass data from the provided Excel file."""
    try:
        file_path = 'biomass.xlsx'  # Path to the uploaded biomass file
        
        # Read all sheets from the Excel file
        sheets = pd.read_excel(file_path, sheet_name=None)
        
        # Process data from all sheets
        biomass_data = {}
        for sheet_name, df in sheets.items():
            df = df.fillna(0)  # Replace NaN with 0 for numeric columns
            df.columns = df.columns.astype(str).str.strip()  # Strip whitespace from column names
            biomass_data[sheet_name] = df.to_dict(orient='records')  # Convert DataFrame to list of dictionaries
        
        return biomass_data
    except Exception as e:
        print(f"Error loading biomass data: {str(e)}")
        return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/plants')
def get_plants():
    try:
        plants_by_state = load_plant_data()
        return jsonify(plants_by_state)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/plants/<state>')
def get_plants_by_state(state):
    try:
        plants_by_state = load_plant_data()
        state = str(state).strip()
        if state in plants_by_state:
            return jsonify(plants_by_state[state])
        else:
            return jsonify({'error': 'State not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/biomass', methods=['GET'])
def get_biomass():
    """API endpoint to return biomass data for a specific state."""
    try:
        state = request.args.get('state', '').strip()
        if not state:
            return jsonify({'error': 'State parameter is missing'}), 400

        biomass_data = load_biomass_data()
        
        # Combine data from all sheets for the given state
        state_data = []
        for sheet_name, data in biomass_data.items():
            state_data.extend([entry for entry in data if entry.get('States', '').strip().lower() == state.lower()])
        
        if state_data:
            return jsonify(state_data), 200
        else:
            return jsonify({'error': f'No data found for state: {state}'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/geojson/<path:filename>')
def serve_geojson(filename):
    return send_from_directory('static/geojson', filename)

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__)

def load_plant_data():
    """Load and process the Excel data"""
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
        print(f"Error loading Excel data: {str(e)}")
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

@app.route('/static/geojson/<path:filename>')
def serve_geojson(filename):
    return send_from_directory('static/geojson', filename)

if __name__ == '__main__':
    app.run(debug=True)






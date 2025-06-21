import sys
import joblib
import json
import os
import warnings
from contextlib import redirect_stderr

def main():
    # Suppress all warnings
    warnings.filterwarnings("ignore")
    
    try:
        # Force flush output
        sys.stdout.reconfigure(line_buffering=True)
        
        model_path = os.path.join(os.path.dirname(__file__), "bp_model.pkl")
        model = joblib.load(model_path)
        
        hr = float(sys.argv[1])
        spo2 = float(sys.argv[2])
        
        if hr <= 0 or spo2 <= 0:
            raise ValueError("HR and SpO2 must be positive")
        
        bp = round(float(model.predict([[hr, spo2]])[0]), 2)
        
        # Directly write to stdout with newline
        print(json.dumps({"bp": bp}), flush=True)
        
    except Exception as e:
        # Write error to stderr and stdout
        print(json.dumps({"error": str(e)}), file=sys.stderr, flush=True)
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    with redirect_stderr(sys.stdout):
        main()
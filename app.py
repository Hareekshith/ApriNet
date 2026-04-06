from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
import io
import os
import json

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/api/apriori', methods=['POST'])
def run_apriori():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        content = file.read()
        
        # Get parameters from form
        try:
            min_support = float(request.form.get('min_support', 0.15))
        except ValueError:
            min_support = 0.15
            
        try:
            min_confidence = float(request.form.get('min_confidence', 0.6))
        except ValueError:
            min_confidence = 0.6

        dataset_type = request.form.get('dataset_type', 'generic')
        selected_columns = request.form.get('selected_columns')
        
        if dataset_type == "kdd":
            columns = [
                "duration","protocol_type","service","flag","src_bytes","dst_bytes",
                "land","wrong_fragment","urgent","hot","num_failed_logins",
                "logged_in","num_compromised","root_shell","su_attempted","num_root",
                "num_file_creations","num_shells","num_access_files","num_outbound_cmds",
                "is_host_login","is_guest_login","count","srv_count","serror_rate",
                "srv_serror_rate","rerror_rate","srv_rerror_rate","same_srv_rate",
                "diff_srv_rate","srv_diff_host_rate","dst_host_count","dst_host_srv_count",
                "dst_host_same_srv_rate","dst_host_diff_srv_rate","dst_host_same_src_port_rate",
                "dst_host_srv_diff_host_rate","dst_host_serror_rate","dst_host_srv_serror_rate",
                "dst_host_rerror_rate","dst_host_srv_rerror_rate","label"
            ]
            df = pd.read_csv(io.BytesIO(content), names=columns)
            if len(df) > 7000:
                df = df.sample(7000, random_state=6)
            df = df[['protocol_type','service','flag']]
            df.loc[:, 'service'] = df['service'].replace(['0', 0], 'unknown')
            transactions = df.astype(str).values.tolist()
        else:
            df = pd.read_csv(io.BytesIO(content), header=0, dtype=str)
            if len(df) > 10000:
                df = df.sample(10000, random_state=6)
            
            # Filter if columns were selected
            if selected_columns:
                try:
                    cols = json.loads(selected_columns)
                    # Filter to columns that actually exist in the dataframe to avoid errors
                    valid_cols = [c for c in cols if c in df.columns]
                    if valid_cols:
                        df = df[valid_cols]
                except json.JSONDecodeError:
                    pass

            transactions = []
            for _, row in df.iterrows():
                transactions.append([str(item).strip() for item in row.dropna() if pd.notna(item) and str(item).strip()])
            
        te = TransactionEncoder()
        te_data = te.fit(transactions).transform(transactions)
        df_encoded = pd.DataFrame(te_data, columns=te.columns_)
        
        frequent_itemsets = apriori(df_encoded, min_support=min_support, use_colnames=True)
        if frequent_itemsets.empty:
            return jsonify({"frequent_itemsets": [], "rules": []})

        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
        if not rules.empty and 'lift' in rules.columns:
            rules = rules[rules['lift'] > 1]
        
        if not frequent_itemsets.empty:
            frequent_itemsets['itemsets'] = frequent_itemsets['itemsets'].apply(lambda x: list(x))
            
        if not rules.empty:
            rules['antecedents'] = rules['antecedents'].apply(lambda x: list(x))
            rules['consequents'] = rules['consequents'].apply(lambda x: list(x))
            rules = rules.sort_values(by='confidence', ascending=False)
            rules_records = rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']].to_dict(orient="records")
        else:
            rules_records = []
            
        return jsonify({
            "frequent_itemsets": frequent_itemsets.to_dict(orient="records"),
            "rules": rules_records
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8000)

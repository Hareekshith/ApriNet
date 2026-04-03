import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Column names
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

# Load dataset
df = pd.read_csv("KDDTrain+.txt", names=columns)

# Reduce size (IMPORTANT)
df = df.sample(3000)

# Select features
df = df[['protocol_type','service','flag']]

# Convert to transactions
transactions = df.astype(str).values.tolist()

# Encode
te = TransactionEncoder()
te_data = te.fit(transactions).transform(transactions)
df_encoded = pd.DataFrame(te_data, columns=te.columns_)

# Apriori
frequent_itemsets = apriori(df_encoded, min_support=0.2, use_colnames=True)

# Rules
rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.6)
# Output
print("\nFrequent Itemsets:\n", frequent_itemsets.head())
print("\nRules:\n", rules[['antecedents','consequents','support','confidence','lift']])

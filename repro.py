import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
import io

content = b"""A,B,C
1,2.0,3
4.5,foo,bar
"""
df = pd.read_csv(io.BytesIO(content), header=0, dtype=str)

transactions = []
for _, row in df.iterrows():
    transactions.append([str(item).strip() for item in row.dropna() if pd.notna(item) and str(item).strip()])

te = TransactionEncoder()
te_data = te.fit(transactions).transform(transactions)
df_encoded = pd.DataFrame(te_data, columns=te.columns_)

print("Encoded columns:", df_encoded.columns)
print("dtypes:", df_encoded.dtypes)

frequent_itemsets = apriori(df_encoded, min_support=0.1, use_colnames=True)
print(frequent_itemsets)

if not frequent_itemsets.empty:
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.1)
    if not rules.empty and 'lift' in rules.columns:
        rules = rules[rules['lift'] > 1]
    
    print("rules:\n", rules)

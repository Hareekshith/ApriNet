# 🚀 ApriNet: Apriori-Based Network Traffic Analysis

ApriNet is a Computer Networks project that applies the Apriori algorithm to analyze network traffic data and discover meaningful patterns using association rule mining.

---

## 📌 Overview

This project uses the **Apriori Algorithm** to extract frequent patterns and relationships between different network features such as protocol type, service, and connection status.

The goal is to identify:

* Frequent network behavior patterns
* Strong associations between network attributes
* Indicators of normal vs suspicious traffic

---

## 🎯 Objectives

* Apply Apriori algorithm on network traffic dataset
* Discover frequent itemsets
* Generate association rules using support, confidence, and lift
* Analyze patterns in network communication
* Identify potential anomalies in traffic behavior

---

## 📂 Dataset

This project uses the **NSL-KDD Dataset**, a refined version of the KDD Cup 99 dataset.

### Features Used:

* `protocol_type` (e.g., TCP, UDP)
* `service` (e.g., HTTP, SSH)
* `flag` (e.g., SF – success, S0 – failure)

---

## ⚙️ Tech Stack

* Python
* Pandas
* Mlxtend

---

## 🛠️ Installation

```bash
pip install pandas mlxtend
```

---

## ▶️ How to Run

1. Clone the repository:

```bash
git clone https://github.com/your-username/aprinet.git
cd aprinet
```

2. Download dataset:

```bash
wget https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain+.txt
```

3. Run the script:

```bash
python3 main.py
```

---

## 🔄 Workflow

```
Dataset → Preprocessing → Transaction Encoding → Apriori → Association Rules → Analysis
```

---

## 📊 Sample Output

### Frequent Itemsets

* `{http}`
* `{SF}`
* `{unknown, S0}`

### Association Rules

* `{http} → {SF}`
* `{unknown} → {S0}`

---

## 🔍 Interpretation

* HTTP traffic is highly associated with successful connections
* Unknown services are strongly linked with failed connections
* Frequent patterns represent normal traffic behavior
* Rare or unusual patterns may indicate anomalies

---

## 🧠 Key Concepts

* **Support**: Frequency of occurrence of itemsets
* **Confidence**: Likelihood of rule correctness
* **Lift**: Strength of association between items

---

## 🚧 Limitations

* Apriori is computationally expensive for large datasets
* Requires careful selection of support threshold
* Not suitable for real-time processing

---

## 🔥 Future Enhancements

* Integrate real-time network monitoring
* Apply FP-Growth for better performance
* Add visualization dashboards
* Extend to intrusion detection systems

---

## 👨‍💻 Author

* Hareekshith

---

## ⭐ Project Title

**Apriori-Based Network Traffic Pattern Analysis for Intrusion Detection**

---

## 📜 License

This project is for academic purposes.

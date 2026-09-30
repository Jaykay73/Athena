import os
import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_golden_datasets(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)
    np.random.seed(42)

    # 1. Products Dataset
    products = [
        {"product_id": "PRD-101", "product": "Athena Enterprise Analytics Platform", "category": "Software", "cost": 450.0, "price": 1200.0},
        {"product_id": "PRD-102", "product": "Athena Cloud Data Connector", "category": "Software", "cost": 120.0, "price": 400.0},
        {"product_id": "PRD-103", "product": "High-Throughput Analytics Server", "category": "Hardware", "cost": 3100.0, "price": 3800.0}, # compressed margin!
        {"product_id": "PRD-104", "product": "Edge Vector Acceleration Unit", "category": "Hardware", "cost": 1800.0, "price": 2200.0}, # compressed margin!
        {"product_id": "PRD-105", "product": "Annual Enterprise Support & SLA", "category": "Services", "cost": 300.0, "price": 1500.0},
        {"product_id": "PRD-106", "product": "Professional Architecture Onboarding", "category": "Services", "cost": 800.0, "price": 2500.0},
        {"product_id": "PRD-107", "product": "Self-Serve Team Tier Seat", "category": "Software", "cost": 15.0, "price": 89.0},
    ]
    df_products = pd.DataFrame(products)
    df_products.to_csv(os.path.join(output_dir, "products.csv"), index=False)

    # 2. Customers Dataset
    customer_rows = []
    regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
    segments = ["Enterprise", "Mid-Market", "SMB"]
    channels = ["Direct Sales", "Partner Referrals", "Inbound Marketing", "Organic Search"]

    for i in range(1, 1501):
        cid = f"CUST-{i:05d}"
        signup = datetime(2023, 1, 1) + timedelta(days=random.randint(0, 1200))
        seg = random.choices(segments, weights=[0.25, 0.35, 0.40])[0]
        reg = random.choices(regions, weights=[0.50, 0.25, 0.15, 0.10])[0]
        chan = random.choice(channels)
        customer_rows.append({
            "customer_id": cid,
            "signup_date": signup.strftime("%Y-%m-%d"),
            "segment": seg,
            "region": reg,
            "country": "United States" if reg == "North America" else ("Germany" if reg == "Europe" else ("Japan" if reg == "Asia-Pacific" else "Brazil")),
            "acquisition_channel": chan
        })
    df_customers = pd.DataFrame(customer_rows)
    df_customers.to_csv(os.path.join(output_dir, "customers.csv"), index=False)

    # 3. Sales Transactions Dataset (10,000 realistic orders modeling Q1-Q3 2026)
    sales_rows = []
    start_date = datetime(2026, 1, 1)
    
    for i in range(1, 10001):
        order_id = f"ORD-{20260000 + i}"
        day_offset = random.randint(0, 272)  # Jan 1 to Sep 30, 2026
        order_date = start_date + timedelta(days=day_offset)
        cust = random.choice(customer_rows)
        prod = random.choice(products)
        
        # Quarter determination
        is_q3 = (order_date.month in [7, 8, 9])
        
        # Introduce the hidden story:
        # In Q3, North America Enterprise volume drops 28%
        if is_q3 and cust["region"] == "North America" and cust["segment"] == "Enterprise":
            if random.random() < 0.28:
                continue  # skip order, causing genuine North America enterprise drop!

        qty = random.randint(1, 8) if cust["segment"] == "Enterprise" else random.randint(1, 3)
        unit_price = prod["price"]
        unit_cost = prod["cost"]
        discount_pct = 0.05 if cust["segment"] != "Enterprise" else round(random.uniform(0.08, 0.14), 2)
        
        gross_rev = qty * unit_price
        net_rev = gross_rev * (1.0 - discount_pct)
        total_cost = qty * unit_cost
        profit = net_rev - total_cost

        # Introduce 14 negative revenue records (refunds/returns edge cases)
        if i in [142, 581, 912, 1420, 2210, 3105, 4120, 5200, 6112, 7300, 8150, 8990, 9400, 9820]:
            net_rev = -abs(round(net_rev * 0.5, 2))
            profit = net_rev

        sales_rows.append({
            "order_id": order_id,
            "customer_id": cust["customer_id"],
            "product_id": prod["product_id"],
            "category": prod["category"],
            "region": cust["region"],
            "country": cust["country"],
            "order_date": order_date.strftime("%Y-%m-%d"),
            "quantity": qty,
            "unit_price": unit_price,
            "discount": discount_pct,
            "revenue": round(net_rev, 2),
            "cost": round(total_cost, 2),
            "profit": round(profit, 2),
            "channel": cust["acquisition_channel"]
        })

    # Add duplicate transactions (0.7% = 70 duplicate rows)
    duplicates = [dict(sales_rows[idx]) for idx in range(100, 170)]
    sales_rows.extend(duplicates)

    # Introduce 3.2% missing region data
    for idx in range(200, 520):
        if idx < len(sales_rows):
            sales_rows[idx]["region"] = None

    df_sales = pd.DataFrame(sales_rows)
    df_sales.to_csv(os.path.join(output_dir, "sales_transactions.csv"), index=False)

    # 4. Marketing Dataset
    marketing_rows = []
    for day in range(0, 273):
        m_date = start_date + timedelta(days=day)
        for ch in channels:
            spend = random.randint(800, 4500)
            imp = spend * random.randint(30, 60)
            clicks = int(imp * random.uniform(0.015, 0.035))
            conv = int(clicks * random.uniform(0.03, 0.08))
            rev_attr = conv * random.randint(180, 500)
            marketing_rows.append({
                "campaign_id": f"CMP-{m_date.strftime('%Y%m')}-{ch[:3].upper()}",
                "date": m_date.strftime("%Y-%m-%d"),
                "channel": ch,
                "spend": spend,
                "impressions": imp,
                "clicks": clicks,
                "conversions": conv,
                "revenue": rev_attr
            })
    df_marketing = pd.DataFrame(marketing_rows)
    df_marketing.to_csv(os.path.join(output_dir, "marketing.csv"), index=False)

    # 5. Pricing & Governance Policy Document (Markdown context for RAG)
    policy_doc = """# Athena Global Enterprise Pricing & Commercial Terms (v2026.3)
**Effective Date:** July 1, 2026
**Target Audience:** Enterprise Sales, Commercial Operations, Finance

## 1. Executive Summary
Following our Q2 2026 revenue review, executive leadership approved stricter commercial guidelines
to protect long-term gross margins and eliminate excessive field discounting.

## 2. Discount Authorization Matrix
- **Tier 1 (0% - 7.5%):** Account Executive standard approval.
- **Tier 2 (7.6% - 15.0%):** Regional Sales Director signoff required.
- **Tier 3 (> 15.0%):** Requires formal VP of Sales & Chief Financial Officer approval via Deal Desk.

## 3. Operational Impact & Procurement Notice
Sales leadership notes that Tier 3 approvals instituted on July 1, 2026 introduced an average Deal Desk
evaluation latency of 14 to 21 business days. In North America, several large enterprise software license
renewals were temporarily deferred into subsequent quarters pending commercial review.

## 4. Hardware Unit Margin Constraints
Due to global server component inflation, minimum gross margins on Hardware server racks (PRD-103 and PRD-104)
must not fall below 18%. Field teams may not bundle hardware discounts without offsetting services attachment.
"""
    with open(os.path.join(output_dir, "pricing_and_discount_policy.md"), "w", encoding="utf-8") as f:
        f.write(policy_doc)

    print(f"Generated golden datasets successfully in {output_dir}")

if __name__ == "__main__":
    generate_golden_datasets("./storage/datasets")

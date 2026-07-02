import json

INPUT_NB = 'Health_Risk_Prediction.ipynb'
with open(INPUT_NB, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for c in nb['cells']:
    if c['cell_type'] == 'code':
        source = "".join(c['source'])
        if "FEATURES_USED =" in source and "if 'gender' in df_clean.columns:" in source:
            # We found the preprocessing cell
            
            new_source_lines = []
            for line in c['source']:
                new_source_lines.append(line)
            
            # Replace the gender inclusion block
            new_code = source.replace(
                "if 'gender' in df_clean.columns:\n    optional_features.append('gender')\n    print(\"'gender' diikutsertakan (akan di-encode)\")",
                "# 'gender' TIDAK diikutsertakan sebagai fitur model.\nprint(\"'gender' TIDAK diikutsertakan sebagai fitur model.\")"
            )
            
            # Since gender is no longer an optional feature, the categorical mapping loop will just process 'age'.
            # 'age' is numeric, so `df_clean[col].dtype == 'object'` will be false.
            # Thus, the categorical mapping block is no longer needed, but it won't crash either.
            # To be clean, we can replace the encoding part entirely, or just let it run on numeric variables.
            new_code = new_code.replace(
                "# 2. Encoding kolom kategorikal (gender, dll.)\ncategorical_mapping = {}\nfor col in optional_features:\n    if df_clean[col].dtype == 'object':\n        le = LabelEncoder()\n        df_clean[col + '_enc'] = le.fit_transform(df_clean[col])\n        categorical_mapping[col] = {cls: int(idx) for idx, cls in enumerate(le.classes_)}\n        FEATURES_USED.append(col + '_enc')\n        print(f\"  {col} di-encode: {categorical_mapping[col]}\")\n    else:\n        FEATURES_USED.append(col)",
                "# 2. Tambahkan fitur opsional numerik\nfor col in optional_features:\n    if col in df_clean.columns and df_clean[col].dtype != 'object':\n        FEATURES_USED.append(col)"
            )
            
            c['source'] = [line + '\n' for line in new_code.split('\n')]
            c['source'][-1] = c['source'][-1].rstrip('\n')  # remove last newline
            print("Successfully modified the preprocessing cell.")
            break

with open(INPUT_NB, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

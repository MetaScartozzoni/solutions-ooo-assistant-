from pathlib import Path
import json

# Configuração do CLASP para o seu projeto
clasp_config = {
    "scriptId": "16L_UmGrkrDKYWrfw9YlnUnnnWOMBEWywyPrZDZIQqKF17Q97RtZeinqn",
    "rootDir": "."
}

# Caminho do arquivo .clasp.json na raiz do projeto
clasp_path = Path(__file__).parent / ".clasp.json"
# Escreve o conteúdo formatado em JSON
clasp_path.write_text(json.dumps(clasp_config, indent=2), encoding="utf-8")

print(f"Arquivo gerado: {clasp_path.resolve()}")

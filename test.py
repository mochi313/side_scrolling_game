import requests

# GETメソッドによるWebページの取得
url = 'https://uniteapi.dev/p/5814972341238685760'
res = requests.get(url)

# Webページの内容
print(res.text)  # 出力結果は省略
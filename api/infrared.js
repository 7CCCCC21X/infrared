export default async function handler(req, res) {
  // CORS（其实前端同域不需要，但留着更稳）
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const address = String(req.query.address || "");
    const chainId = String(req.query.chainId || "80094");

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const upstream = `https://infrared.finance/api/airdrop/${address}?chainId=${chainId}`;

    const resp = await fetch(upstream, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "user-agent": "Mozilla/5.0 Infrared-Airdrop-Proxy",
      },
    });

    const text = await resp.text();

    res.setHeader(
      "Content-Type",
      resp.headers.get("content-type") || "application/json; charset=utf-8"
    );

    // 缓存 30 秒，防止频繁刷接口
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    return res.status(resp.status).send(text);
  } catch (e) {
    return res.status(500).json({
      error: "Proxy error",
      detail: String(e?.message || e),
    });
  }
}

import useSWR from "swr";

const URL =
  "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";

const fetcher = async (url) => {
  const response = await fetch(url);
  const json = await response.json();

  if (json.market_data) {
    return {
      price_usd: json.market_data.current_price.usd,
      price_btc: json.market_data.current_price.btc,
      marketCap_usd: json.market_data.market_cap.usd,
      price_change_percentage_24h: json.market_data.price_change_percentage_24h,
    };
  }

  return null;
};

export const GetEtherPrice = () => {
  const { data, ...rest } = useSWR(URL, fetcher, { refreshInterval: 10000 });

  return { eth: { data, ...rest } };
};

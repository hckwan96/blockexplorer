import { formatCurrency } from "../utils/common";
import { GetEtherPrice } from "../utils/getEtherPrice";

export default function EtherPrice() {
  const { eth } = GetEtherPrice();

  return (
    <>
      {eth && eth.data ? (
        <div className="flex flex-col md:flex-row px-4 md:px-12 py-1 md:py-6 sm:px-1 sm:py-4 items-stretch">
          <div className="flex flex-col md:flex-row justify-between text-sm border rounded shadow-xl py-6 px-6 w-full bg-white">
            <div className="mb-2 md:mb-0 md:mr-4">
              Ether Price: {formatCurrency(eth.data.price_usd)} @ {eth.data.price_btc} BTC
              <span className="ml-2" style={{ color: eth.data.price_change_percentage_24h >= 0 ? "green" : "red" }}>
                ({eth.data.price_change_percentage_24h}%)
              </span>
            </div>
            <div>
              Market Cap: {formatCurrency(eth.data.marketCap_usd)}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

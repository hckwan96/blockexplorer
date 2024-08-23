import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAddressTokens } from "../utils/alchemy";
import { formatAddress, formatNumber } from "../utils/common";
import { CopyToClip } from "../utils/copyToClip";

export function ListTokens({address})
{
  const [loading, setLoading] = useState(true);
  const [addressTokens, setAddressTokens] = useState();
  let hasCopy = true;

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
        const res = await getAddressTokens(address, 20);

        if (mounted)
        {
          setAddressTokens(res);
        }
        setLoading(false);
    })();
    return () => mounted = false;
}, [address]);

return loading ? (
    <h1 className="text-center">Loading...</h1>
  ) : (
    <>
      <div className="flex py-1 font-bold">
          <h1 className="w-4/12">Asset name</h1>
          <h1 className="w-2/12">Symbol</h1>
          <h1 className="w-4/12">Contract address</h1>
          <h1 className="w-2/12 text-right">Qty</h1>
      </div>
      {
        addressTokens.tokenBalances.length <= 0 ? (
          <p className="py-4 text-[#ff0000]">No token.</p>
      ) : (
          addressTokens.tokenBalances.map((token, idx)  => {
              return (
                  <div key={idx} className="flex py-4">
                      <p className="w-4/12">
                      {token.logo && (
                            <img className="inline"
                            style={{
                              width: "auto",
                              maxHeight: "12px",
                            }}
                            src={token.logo}
                            alt={token.name}
                          />
                        )}
                        { token.name.substring(0, 12) }
                        { token.name.length >12 ? ("...") : ("")}
                      </p>
                      <p className="w-2/12">
                        {token.symbol.substring(0, 9)}
                        { token.symbol.length > 9 ? ("...") : ("")}
                      </p>
                      <p className="w-4/12 text-[#357BAD]">
                          <Link to={`/address/${token.contractAddress}`}>
                              {formatAddress(token.contractAddress)}
                          </Link>
                          {hasCopy && (
                              <CopyToClip text={token.contractAddress}  />
                          )}
                      </p>
                      <p className="w-2/12 text-right">
                      {
                        token.normalizedBalance > 1 && token.normalizedBalance.length > 6 ?
                          parseFloat(token.normalizedBalance).toPrecision(6)
                        :
                          formatNumber(token.normalizedBalance)
                      }
                      </p>
                  </div>
                )}
              )
          )
      }
    </>
  )
}
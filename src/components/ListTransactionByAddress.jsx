import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAddressTransactions } from "../utils/alchemy";
import { formatAddress, convertToTimestamp, formatTimeAgo, formatNumber, reverseLookup } from "../utils/common";
import { CopyToClip } from "../utils/copyToClip";

export function ListTransactionsByAddress({address, dir})
{
  const [loading, setLoading] = useState(true);
  const [externalTxs, setExternalTxs] = useState([]);
  const [ensNamesFrom, setEnsNamesFrom] = useState({});
  const [ensNamesTo, setEnsNamesTo] = useState({});

  const resolveName = process.env.REACT_APP_RESOLVE_NAME;
  let hasCopy = true;

  useEffect(() => {
    let mounted = true;

    (async () => {
        const { transfers } = await getAddressTransactions(address, dir);

        if (mounted)
        {
          setExternalTxs(transfers);


          if (resolveName) 
          {
            for (let tx of transfers) 
            {
              if (!ensNamesFrom[tx.from]) 
              {
                const ensNameFrom = await reverseLookup(tx.from);
                setEnsNamesFrom((prevEnsNames) => ({
                  ...prevEnsNames,
                  [tx.from]: ensNameFrom || formatAddress(tx.from),
                }));
              }

              if (tx.to && !ensNamesTo[tx.to]) 
              {
                const ensNameTo = await reverseLookup(tx.to);
                setEnsNamesTo((prevEnsNames) => ({
                  ...prevEnsNames,
                  [tx.to]: ensNameTo || formatAddress(tx.to),
                }));
              }
            }
          }
        }
        setLoading(false);
    })();

    return () => mounted = false;
  }, [address, dir]);

  return  loading ? (
    <h1 className="text-center">Loading...</h1>
  )
  :
  (
    <>
      <div className="flex py-1 font-bold">
          <h1 className="w-3/12">Txn Hash</h1>
          <h1 className="w-2/12">Block</h1>
          <h1 className="w-1/12">Age</h1>
          <h1 className="w-3/12">
            { 
              dir === "to" ? ("From") :  ("To")
            }
            &nbsp;Address
          </h1>
          <h1 className="w-3/12">Value</h1>
      </div>
      {externalTxs.length <= 0 ? (
          <p className="py-4">No transaction found.</p>
      ) : (
          externalTxs.map((tx, index) => 
          {
            const minerAddressFrom = ensNamesFrom[tx.from] || formatAddress(tx.from);
            const minerAddressTo = ensNamesTo[tx.to] || formatAddress(tx.to);
              return (
                  <div key={index} className="flex py-4">
                      <p className="w-3/12 text-[#357BAD]">
                          <Link to={`/tx/${tx.hash}`}>
                              {formatAddress(tx.hash)}
                          </Link>
                          {hasCopy && (
                              <CopyToClip text={tx.hash}  />
                          )}
                      </p>
                      <p className="w-2/12 text-[#357BAD]">
                        <Link to={`/block/${tx.blockNum}`}>
                          {Number(tx.blockNum)}
                        </Link>
                      </p>
                      <p className="w-1/12">
                          { formatTimeAgo(convertToTimestamp(tx.metadata.blockTimestamp)) }
                      </p>
                      <p className="w-3/12">
                        {
                          dir === "to" ?
                            (
                              <>
                                <Link to={`/address/${tx.to}`} className="text-[#357BAD]">
                                  {minerAddressFrom} 
                                </Link>
                                {hasCopy && <
                                  CopyToClip text={tx.from} />
                                }
                              </>
                            )
                          :
                            (
                              <>
                                <Link to={`/address/${tx.to}`} className="text-[#357BAD]">
                                  {minerAddressTo}
                                </Link>
                                {hasCopy && <
                                  CopyToClip text={tx.to} />
                                }
                              </>
                          )
                        }
                      </p>
                      <p className="w-3/12">
                          {
                            tx.value > 1 && Math.ceil(Math.log10(tx.value + 1)) > 6 ?
                              parseFloat(tx.value).toPrecision(6)
                            :
                              formatNumber(tx.value, 8) 
                          }<br />{tx.asset}
                      </p>
                  </div>
              );
          })
      )}
    </>
  );
}
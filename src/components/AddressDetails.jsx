import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useParams, Link } from "react-router-dom";
import {  getAddressBalance } from "../utils/alchemy";
import { GetEtherPrice } from "../utils/getEtherPrice";
import { formatAddress, formatCurrency, reverseLookup } from "../utils/common";
import { ListTransactionsByAddress } from "./ListTransactionByAddress"
import { ListTokens } from "./ListTokens";
import ScrollToTopButton from "./ScrollToTopButton";

function AddressDetails({ _dir = "from" }) {
    const { address } = useParams();
    const [balance, setBalance] = useState("");
    const [ensName, setENSName] = useState("");
    const [loading, setLoading] = useState(true);
    const { eth } = GetEtherPrice();
    const [dir, setDir] = useState(_dir);
    const chgDir = (_dir) => setDir(_dir);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const {balance} = await getAddressBalance(address);
            let res = await reverseLookup(address);
            setENSName(res)

            if (mounted)
                setBalance(ethers.utils.formatEther(balance).toString());
            setLoading(false);
        })();
        
        return () => mounted = false;
    }, [address, dir]);
    
    return loading ? (
        <h1 className="text-center">Loading...</h1>
    ) : (
        <div>
            <div className="md:mx-28 md:mt-4 py-2 px-6 font-bold">
                Address {address} &nbsp; {ensName ? (ensName) : ""}
            </div>
            <div className="flex flex-col md:flex-row md:mx-24 md:px-2 md:p-0 md:my-0 sm:px-1 sm:py-4 items-stretch">
                <div className="flex flex-col md:flex-row justify-between text-sm border rounded shadow-xl py-6 px-6 w-full bg-white">
                    <div className="mb-2 md:mb-0 md:mr-4">
                        <h1 className="font-bold">
                            Balance{" "}
                            <span className="ml-4 font-normal">{balance} Ether</span>
                        </h1>
                    </div>
                    <div className="mb-2 md:mb-0 md:mr-4">
                        <h1 className="font-bold">
                            Token value 
                            <span className="ml-4 font-normal">{formatCurrency(balance * eth.data.price_usd)} @ {eth.data.price_usd}</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row px-4 md:px-12 py-4 items-stretch">
                <div className="px-4 border rounded-lg w-full md:w-5/12 bg-white-200 py-4 mb-4 md:mb-0 md:mr-2">
                    <h1 className="py-4 text-base font-bold text-left">Tokens</h1>
                    <ListTokens address={address} />
                </div>

                <div className="px-4 border rounded-lg w-full md:w-7/12 bg-white-200 py-4 md:ml-2">
                    <div className="flex flex-col md:flex-row items-stretch w-full">
                        <div className="flex items-center justify-between w-full">
                            <h1 className="py-4 text-base font-bold text-left">
                                Transactions {dir} {ensName ? ensName : formatAddress(address)}
                            </h1>
                            <div className="flex space-x-2">
                                <Link
                                    to={`/address/${address}`}
                                    onClick={() => chgDir('from')}
                                    className={`px-3 py-1 text-sm border rounded-md transition-colors duration-300 ${dir === 'from' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                >
                                    From
                                </Link>
                                <Link
                                    to={`/address/${address}`}
                                    onClick={() => chgDir('to')}
                                    className={`px-3 py-1 text-sm border rounded-md transition-colors duration-300 ${dir === 'to' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                >
                                    To
                                </Link>
                            </div>
                        </div>
                    </div>
                    <ListTransactionsByAddress address={address} dir={dir}/>
                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
}

export default AddressDetails;

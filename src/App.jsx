import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getLatestBlockNumber } from "./utils/alchemy";

import "./App.css";

import Header from "./components/Header";
import MainPage from "./components/MainPage";
import ListAllBlocks from "./components/ListAllBlocks";
import Block from "./components/Block";
import ListAllTransactions from "./components/ListAllTransactions";
import Transaction from "./components/Transaction";
import AddressDetails from "./components/AddressDetails";
import Footer from "./components/Footer";

function App() {
    const [blockNumber, setBlockNumber] = useState();

    useEffect(() => {
        let mounted = true;
        (async () => {
            const res  = await getLatestBlockNumber();
    
            if (mounted)
                setBlockNumber(res);
        })();
    
        return () => mounted = false;
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-50">
                <Routes>
                    <Route path="/" element={<MainPage blockNumber={blockNumber} />} />
                    <Route path="/blocks" element={<ListAllBlocks initialBlockNumber={blockNumber} />} />
                    <Route path="/block/:blockNumber" element={<Block />} />
                    <Route path="/txs" element={<ListAllTransactions initialBlockNumber={blockNumber} />} />
                    <Route path="/tx/:transHash" element={<Transaction />} />
                    <Route path="/address/:address" element={<AddressDetails />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;

import EtherPrice from "./EtherPrice";
import ListBlocks from "./ListBlocks";
import ListTransactions from "./ListTransactions";
import ScrollToTopButton from "./ScrollToTopButton";

function MainPage({ blockNumber }) {
    return (
        <div className="flex flex-col">
            <div className="bg-white-200 text-black text-center py-2 px-4">
                <EtherPrice />
            </div>
            <div className="flex flex-col md:flex-row px-4 md:px-12 py-1 items-stretch">
                <div className="px-4 border rounded-lg w-full md:w-1/2 bg-white-200 text-center py-4 mb-4 md:mb-0 md:mr-2">
                    <h1 className="py-4 text-base font-bold">Latest Blocks</h1>
                    <ListBlocks blockNumber={blockNumber} />
                </div>

                <div className="px-4 border rounded-lg w-full md:w-1/2 bg-white-200 text-center py-4 md:ml-2">
                    <h1 className="py-4 text-base font-bold">Latest Transactions</h1>
                    <ListTransactions blockNumber={blockNumber} />
                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
}

export default MainPage;

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ETHEREUM_LOGO from "../assets/images/Ethereum_logo.png";

function Header() {
    const [address, setAddress] = useState("");
    const navigate = useNavigate();
    const location = useLocation(); 
    const [isOpen, setIsOpen] = useState(false);

    const toggleSearch = () => {
        setIsOpen(!isOpen);
    };

    function handleOnSubmit(event)
    {
        event.preventDefault();

        if (location.pathname !== `/address/${address}`) {
            navigate(`/address/${address}`);
        }

        setAddress("");
        setIsOpen(false);
    }

    return (
        <header className="relative flex items-center justify-between p-4 bg-white">
            <Link to="/">
                <img src={ETHEREUM_LOGO} alt="Ethereum Logo" className="h-10" />
            </Link>

            <h1 className="ml-4 font-bold text-2xl mr-auto">
                <Link to="/">Ethereum Block Explorer</Link>
                <div className="text-xs mt-0">Powered by Alchemy SDK</div>
            </h1>

            {/* Search Icon for small screens */}
            <div className="md:hidden">
                <FaSearch size={24} onClick={toggleSearch} className="cursor-pointer" />
            </div>

            {/* Search Input for large screens */}
            <form onSubmit={handleOnSubmit} className="hidden md:block md:w-7/12 ml-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaSearch />
                    </div>
                    <input
                        type="search"
                        id="default-search"
                        className="block text-gray-900 w-full p-4 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 ring-red-300"
                        placeholder="Search addresses..."
                        required
                        value={address}
                        onChange={(event) => {
                            setAddress(event.target.value);
                        }}
                    />
                    <button
                        type="submit"
                        className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Overlay Search Input for small screens */}
            {isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <form onSubmit={handleOnSubmit} className="flex flex-col items-center">
                        <input
                            type="text"
                            placeholder="Search addresses..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="block text-gray-900 w-96 p-4 pl-4 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 ring-red-300"
                            autoFocus
                        />
                        <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Search</button>
                    </form>
                    <button onClick={toggleSearch} className="absolute top-4 right-4 text-white text-2xl">×</button>
                </div>
            )}
        </header>
    );
}

export default Header;

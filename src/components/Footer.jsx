import { AiOutlineVerticalAlignTop } from "react-icons/ai";

function Footer() {
    return (
        <footer className="flex px-24 py-1 bg-white text-center items-center border-t">
            <p className="mr-auto text-lg">
                Ethereum Blockchain Explorer
            </p>
            <div className="flex items-center w-1 justify-right">
                <button
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                    aria-label="Scroll to top"
                >
                    <AiOutlineVerticalAlignTop size="26" color="#000" />
                </button>
            </div>
        </footer>
    );
}

export default Footer;

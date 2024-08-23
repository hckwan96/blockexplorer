import React, { useEffect, useState } from "react";
import { AiOutlineVerticalAlignTop } from "react-icons/ai";

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 200) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    return (
        <div>
            {isVisible && (
                <div 
                    className="fixed bottom-8 right-8 bg-blue-500 text-white p-3 rounded-full cursor-pointer shadow-lg"
                    onClick={scrollToTop}
                >
                    <AiOutlineVerticalAlignTop size="24" />
                </div>
            )}
        </div>
    );
}

export default ScrollToTopButton;

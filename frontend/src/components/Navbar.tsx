function Navbar() {
    return (
        <nav className='flex'>
            <a href="/">UIUC Atlas</a>
            <div className="flex-1">
                <a href="/">Map</a>
                <a href="/about">About</a>
                <a href="/privacy">Privacy</a>
            </div>
        </nav>
    );
};

export default Navbar;
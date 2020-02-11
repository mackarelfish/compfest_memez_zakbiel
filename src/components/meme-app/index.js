import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";

import "./MemeApp.css";

import Meme from "../meme";
import Nav from "../nav";

function MemeApp() {
    // handle storing memez
    const [memes, setMemes] = useState({ loading: true, memes: [], count: 0 });
    useEffect(() => {
        if (localStorage.getItem("memez_data")) {
            setMemes({
                loading: false,
                count: JSON.parse(localStorage.getItem("memez_data")).count,
                memes: JSON.parse(localStorage.getItem("memez_data")).memes
            });
            return;
        }
        fetchMemez();
    }, []);

    // handle sorting memez from search
    const [search, setSearch] = useState("");
    const [res, setRes] = useState([]);
    useEffect(() => {
        if (!search) return;
        setRes(
            memes.memes.filter(e => {
                let res = true;
                for (let s of search.split(" ")) {
                    if (!e.title.toLowerCase().includes(s.toLowerCase()))
                        res = false;
                }
                return res;
            })
        );
    }, [search, memes.memes]);

    // handle scrolling ad infinitum
    const [intersect, setIntersect] = useState(false);
    const butRef = useRef();
    useLayoutEffect(() => {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => setIntersect(e.isIntersecting));
        });
        if (!memes.loading && butRef.current) observer.observe(butRef.current);
    });

    useEffect(() => {
        if (intersect) fetchMemez();
    }, [intersect, search]);

    // func for fetching memez
    function fetchMemez() {
        setMemes(({ memes, count }) => ({ loading: true, memes, count }));
        fetch("https://meme-api.herokuapp.com/gimme/10")
            .then(r => r.json())
            .then(d => {
                d.loading = false;
                if (d.memes) {
                    setMemes(prev => {
                        return {
                            loading: d.loading,
                            count: [...prev.memes, ...d.memes].length,
                            memes: [...prev.memes, ...d.memes]
                        };
                    });
                }
                localStorage.setItem("memez_data", JSON.stringify(d));
            });
    }

    return (
        <Router>
            <Nav setSearch={setSearch} search={search} />
            <Switch>
                <Route exact path="/">
                    <Redirect to="/discover" />
                </Route>
                <Route path="/discover">
                    <div className="App">
                        <div className="memeGrid">
                            {search
                                ? res.map((items, idx) => {
                                      return <Meme {...items} key={idx} />;
                                  })
                                : memes.memes.map((items, idx) => {
                                      return <Meme {...items} key={idx} />;
                                  })}
                        </div>
                        {memes.loading && (
                            <div style={{ width: "100%", textAlign: "center" }}>
                                <img
                                    src="https://media.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif"
                                    alt=""
                                />
                            </div>
                        )}
                        <button ref={butRef} onClick={fetchMemez}>
                            fetch the memez
                        </button>
                    </div>
                </Route>
            </Switch>
        </Router>
    );
}

export default MemeApp;

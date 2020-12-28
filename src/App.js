import React, { useEffect, useState } from 'react';
import CloseGame from './CloseGame';
import "./App.css";
import { Container, NavDropdown } from 'react-bootstrap';
import { Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    const yearsToFetch = [2017, 2018, 2019, 2020];
    const [postseasonWeeks, setPostseasonWeeks] = useState([]);
    const [regularSeasonWeeks, setRegularWeeks] = useState([]);
    const [closeGames, setCloseGames] = useState([]);
    const [seasonTitle, setSeasonTitle] = useState("")
    const [weekTitle, setWeekTitle] = useState("");
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        const getAllTeams = async () => {
            const response = await fetch(`https://api.collegefootballdata.com/teams`);
            const data = await response.json();

            setTeams(data);
        }

        const getCalendar = async () => {
            const allPostseasonWeeks = [];
            const allRegularSeasonWeeks = [];
            var latestWeek = [];

            for (var i = 0; i < yearsToFetch.length; i++) {
                const response = await fetch("https://api.collegefootballdata.com/calendar?year=" + yearsToFetch[i]);
                const data = await response.json();

                const yearFetchedRegularSeasonWeeks = [];
                const yearFetchedPostseasonWeeks = [];

                Object.keys(data).forEach(key => {
                    if (data[key].seasonType === 'postseason') {
                        yearFetchedPostseasonWeeks.push(data[key]);
                    } else {
                        yearFetchedRegularSeasonWeeks.push(data[key]);
                    }
                });

                allRegularSeasonWeeks.push(yearFetchedRegularSeasonWeeks);
                allPostseasonWeeks.push(yearFetchedPostseasonWeeks);

                if (i === yearsToFetch.length - 1) {
                    if (yearFetchedPostseasonWeeks.length === 0) {
                        latestWeek = yearFetchedRegularSeasonWeeks[yearFetchedRegularSeasonWeeks.length - 1];
                    } else {
                        latestWeek = yearFetchedPostseasonWeeks[yearFetchedPostseasonWeeks.length - 1];
                    }
                }
            }

            setPostseasonWeeks(allPostseasonWeeks);
            setRegularWeeks(allRegularSeasonWeeks);

            // const week = latestWeek.week;
            // const seasonType = latestWeek.seasonType;
            // getCloseGames(seasonType, week);
        }

        getCalendar();
        getAllTeams();
    }, []);

    const getCloseGames = async (seasonType, week, year) => {
        const response = await fetch(`https://api.collegefootballdata.com/games?year=${year}&week=${week}&seasonType=${seasonType}`);
        const data = await response.json();

        const closeOnes = [];

        Object.keys(data).forEach(key => {
            const homeScore = data[key].home_points;
            const awayScore = data[key].away_points;

            if (awayScore !== null && homeScore !== null) {
                if (Math.abs(homeScore - awayScore) <= 10) {
                    closeOnes.push(data[key]);
                }
            }
        });

        closeOnes.sort(function (a, b) {
            return b.excitement_index - a.excitement_index;
        });
        setCloseGames(closeOnes);
        setWeekTitle(getWeekTitle(seasonType, week));
        setSeasonTitle(getSeasonTitle(seasonType, year));
        window.scrollTo(0, 0);
    }

    const getWeekTitle = (seasonType, week) => {
        if (seasonType === 'postseason') {
            return "Bowls";
        } else {
            return "Week " + week;
        }
    }

    const getSeasonTitle = (seasonType, year) => {
        if (seasonType === 'postseason') {
            return year;
        } else {
            return year + " Regular Season";
        }
    }

    const getMenuTitle = (year) => {
        return year + " Season";
    }

    return (
        <Container className="main">
            <Navbar bg="light" expand="xxl" collapseOnSelect sticky="top">
                <Navbar.Brand className="title">Close Ones</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        {yearsToFetch.map((year, i) => (
                            <NavDropdown title={getMenuTitle(year)}>
                                {regularSeasonWeeks[i].map(week => (
                                    <Nav.Link key={week.firstGameStart} eventKey
                                        onClick={() => getCloseGames(week.seasonType, week.week, year)}
                                        style={{ textTransform: 'capitalize' }}>{getWeekTitle(week.seasonType, week.week)}</Nav.Link>
                                ))}
                                {postseasonWeeks[i].map(week => (
                                    <Nav.Link key={week.firstGameStart} eventKey
                                        onClick={() => getCloseGames(week.seasonType, week.week, year)}
                                        style={{ textTransform: 'capitalize' }}>Bowls</Nav.Link>
                                ))}
                            </NavDropdown>
                        ))}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Container>
                <span className="week-header-season-type">{seasonTitle}</span>
                <h2 className="week-header">{weekTitle}</h2><hr />

                {closeGames.map(closeGame => (
                    <CloseGame
                        key={closeGame.id}
                        awayTeam={closeGame.away_team}
                        homeTeam={closeGame.home_team}
                        awayId={closeGame.away_id}
                        homeId={closeGame.home_id}
                        teams={teams} />
                ))}
            </Container>
        </Container>
    );
};

export default App;

import React, { useEffect, useState } from 'react';
import CloseGame from './CloseGame';
import './App.css';
import { Container, NavDropdown } from 'react-bootstrap';
import { Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Team from './interfaces/Team';
import Game from './interfaces/Game';

const App = () => {
    const yearsToFetch: number[] = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const [weeks, setWeeks] = useState<any>([]);
    const [closeGames, setCloseGames] = useState<any>([]);
    const [seasonTitle, setSeasonTitle] = useState("");
    const [weekTitle, setWeekTitle] = useState("");
    const [teams, setTeams] = useState<any>([]);

    useEffect(() => {
        const getAllTeams = async () => {
            const response = await fetch(`https://api.collegefootballdata.com/teams`);
            const data = await response.json();
            setTeams(data as Team[]);
        }

        const getCalendar = async () => {
            const d = [];

            for (var i = 0; i < yearsToFetch.length; i++) {
                const response = await fetch("https://api.collegefootballdata.com/calendar?year=" + yearsToFetch[i]);
                const data = await response.json();

                const validYear = Object.keys(data).length > 0;

                if (validYear) {
                    d.push(data);
                }
            }

            const currentSeason = d[d.length - 1];
            const seasonType = currentSeason[currentSeason.length - 1].seasonType;
            const week = currentSeason[currentSeason.length - 1].week;
            const season = currentSeason[currentSeason.length - 1].season;

            setWeeks(d);

            getCloseGames(seasonType, week, season);
        }
        getCalendar();
        getAllTeams();
    }, []);

    const getCloseGames = async (seasonType: string, week: number, year: number) => {
        const response = await fetch(`https://api.collegefootballdata.com/games?year=${year}&week=${week}&seasonType=${seasonType}`);
        const data = await response.json();

        const closeOnes: Game[] | ((prevState: Game[]) => Game[]) = [];

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
            return +b.excitement_index - +a.excitement_index;
        });
        setCloseGames(closeOnes);
        setWeekTitle(getWeekTitle(seasonType, week));
        setSeasonTitle(getSeasonTitle(seasonType, year));
        window.scrollTo(0, 0);
    }

    const getWeekTitle = (seasonType: string, week: number) => {
        if (seasonType === 'postseason') {
            return "Bowls";
        } else {
            return "Week " + week;
        }
    }

    const getSeasonTitle = (seasonType: string, year: number) => {
        if (seasonType === 'postseason') {
            return "" + year;
        } else {
            return year + " Regular Season";
        }
    }

    const getMenuTitle = (year: number) => {
        return year + " Season";
    }

    const getYearWeeks = (index: number) => {
        if (weeks.length === 0) {
            return;
        } else {
            return (
                <NavDropdown id={getId(yearsToFetch[index])} title={getMenuTitle(yearsToFetch[index])} key={getId(yearsToFetch[index])} className="year-dropdown">

                    {weeks[index].map((week: { firstGameStart: string | number | null | undefined; seasonType: string; week: number; }, i: any) => (
                        <Nav.Link key={week.firstGameStart} eventKey className="weekOfYear"
                            onClick={() => getCloseGames(week.seasonType, week.week, yearsToFetch[index])}
                        >{getWeekTitle(week.seasonType, week.week)}</Nav.Link>
                    ))
                    }

                </NavDropdown>
            )
        }
    }

    const getId = (year: number) => {
        return year + "season";
    }

    return (
        <Container className="main">
            <Navbar expand="xl" collapseOnSelect >
                <Navbar.Brand className="title">Close Ones</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">

                        {
                            weeks.map((week: any, index: any) => (
                                getYearWeeks(index)
                            ))
                        }

                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <span className="week-header-season-type">{seasonTitle}</span>
            <h2 className="week-header">{weekTitle}</h2>
            <Container>


                {closeGames.map((closeGame: Game) => (
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

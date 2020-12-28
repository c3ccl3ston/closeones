import React, { useEffect, useState } from 'react';
import CloseGame from './CloseGame';
import "./App.css";
import { Container, NavDropdown } from 'react-bootstrap';
import { Nav, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Team {
    id: number;
    school: string;
    mascot: string;
    abbreviation: string;
    alt_name1: string;
    alt_name2: string;
    alt_name3: string;
    conference: string;
    division: string;
    color: string;
    alt_color: string;
    logos: string[];
}

interface Game {
    id: number;
    season: number;
    week: number;
    season_type: string;
    start_date: string;
    start_time_tbd: boolean;
    neutral_site: boolean;
    conference_game: boolean;
    attendance: number;
    venur_id: number;
    venue: string;
    home_id: number;
    home_team: string;
    home_conference: string;
    home_points: number;
    home_line_scores: number[];
    home_post_win_prob: string;
    away_id: number;
    away_team: string;
    away_conference: string;
    away_points: number;
    away_line_scores: number[];
    away_post_win_prob: string;
    excitement_index: string;
}

interface Week {
    season: string;
    week: number;
    seasonType: string;
    firstGameStart: string;
    lastGameStart: string;
}

const App = () => {
    const yearsToFetch: number[] = [2015,2016,2017,2018,2019,2020];
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
            var seasonType;
            var week;

            for (var i = 0; i < yearsToFetch.length; i++) {
                const response = await fetch("https://api.collegefootballdata.com/calendar?year=" + yearsToFetch[i]);
                const data = await response.json();

                d.push(data);

                if (i === yearsToFetch.length - 1) {
                    seasonType = data[data.length - 1].seasonType;
                    week = data[data.length - 1].week;
                }
            }

            setWeeks(d);

            getCloseGames(seasonType, week, yearsToFetch[yearsToFetch.length - 1]);
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
                        <Nav.Link key={week.firstGameStart} eventKey
                            onClick={() => getCloseGames(week.seasonType, week.week, yearsToFetch[index])}
                            style={{ textTransform: 'capitalize' }}>{getWeekTitle(week.seasonType, week.week)}</Nav.Link>
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
            <Container>
                <span className="week-header-season-type">{seasonTitle}</span>
                <h2 className="week-header">{weekTitle}</h2><hr />

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

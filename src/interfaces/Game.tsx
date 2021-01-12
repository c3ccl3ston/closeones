import React from 'react';

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

export default Game;

import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const CloseGame = ({ awayTeam, homeTeam, awayId, homeId, teams }) => {

    const getImage = (teamId) => {
        for(var i = 0; i < teams.length; i++) {
            if(teams[i].id === teamId) {
                return teams[i].logos[0];
            }
        }
    }

    return (
        <Card>
            <Card.Body>
            <div className="teamName"><img src={getImage(awayId)}  alt="Away team logo" className="team-logo" />{awayTeam}</div>
            <div className="vs">at</div>
            <div className="teamName"><img src={getImage(homeId)} alt="Home team logo" className="team-logo" />{homeTeam}</div>
            </Card.Body>
        </Card>
    );
}

export default CloseGame;

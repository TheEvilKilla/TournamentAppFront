import React, { useEffect, useState } from "react";
import TournamentList from "../tournament/tournament-list/tournament-list";
import NavBar from '../navbar/navbar';
import "./main.scss";

function Main() {
    const [tournaments, setTournaments] = useState([]);
    const [filteredTournaments, setFilteredTournaments] = useState([]);
    const userId = localStorage.getItem('user');
    const userRole = JSON.parse(localStorage.getItem('user-complete')).role;

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/tournaments');
                const data = await response.json();
                const tournamentsWithParticipants = await Promise.all(data.map(async tournament => {
                    try {
                        const participantsResponse = await fetch(`http://localhost:8080/api/v1/tournament/${tournament.id}/users`);
                        const participantsData = await participantsResponse.json();
                        const isRegistered = participantsData.some(participant => participant.id === userId);
                        return {
                            ...tournament,
                            currentParticipants: participantsData.length,
                            isRegistered: isRegistered
                        };
                    } catch (error) {
                        console.error(`Error fetching participants for tournament ${tournament.id}:`, error);
                        return {
                            ...tournament,
                            currentParticipants: 0,
                            isRegistered: false
                        };
                    }
                }));
                setTournaments(tournamentsWithParticipants);
                setFilteredTournaments(tournamentsWithParticipants); // Initialize filteredTournaments
            } catch (error) {
                console.error("There was an error fetching the tournaments!", error);
            }
        };

        fetchTournaments();
    }, [userId, tournaments]);

    const handleSearch = (query) => {
        if (!query) {
            setFilteredTournaments(tournaments);
        } else {
            const filtered = tournaments.filter(tournament =>
                tournament.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredTournaments(filtered);
        }
    };

    return (
        <div>
            <NavBar handleSearch={handleSearch}></NavBar>
            <TournamentList tournaments={filteredTournaments} userRole={userRole}></TournamentList>
        </div>
    );
}

export default Main;

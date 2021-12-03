import urlExist from 'url-exist';
import UrlError from '../errors/UrlError.js';
import * as recommendationRepository from '../repositories/recommendationRepository.js';
import NoRecommendationError from '../errors/NoRecommendationError.js';

async function saveRecommendation({ name, youtubeLink }) {
    const exists = await urlExist(youtubeLink);
    if (!exists) {
        throw new UrlError('This video was not found');
    }
    await recommendationRepository.save({ name, youtubeLink });
}

async function upvoteRecommendation({ id }) {
    await recommendationRepository.editScore({ id, scoreUpdate: '+ 1' });
}

async function downvoteRecommendation({ id }) {
    await recommendationRepository.editScore({ id, scoreUpdate: '- 1' });
}

async function getRandomRecommendation() {
    const recommendations = await recommendationRepository.getRecommendations();
    const validRecommendations = getValidRecommendations({ recommendations });

    if (validRecommendations.length === 1) {
        return recommendations[0];
    }

    if (validRecommendations.length === 0) {
        throw new NoRecommendationError('Sorry, any recommendation today :(');
    }

    const random = parseInt(Math.random() * 10);
    if (random < 7) {
        return getRandomRecommendationByScore({
            recommendations: validRecommendations,
            minScore: 11,
        });
    }
    return getRandomRecommendationByScore({
        recommendations: validRecommendations,
        minScore: -5,
        maxScore: 10,
    });
}

function getValidRecommendations({ recommendations }) {
    return recommendations.filter(
        (recommendation) => recommendation.score >= -5
    );
}

function getRandomRecommendationByScore({
    recommendations,
    minScore,
    maxScore,
}) {
    const filteredRecommendations = recommendations.filter(
        (recommendation) =>
            recommendation.score >= (minScore ? minScore : -Infinity) &&
            recommendation.score <= (maxScore ? maxScore : +Infinity)
    );

    if (filteredRecommendations.length === 0) {
        const maxRandom = recommendations.length;
        const random = parseInt(Math.random() * maxRandom);
        return recommendations[random];
    }

    const maxRandom = filteredRecommendations.length;
    const random = parseInt(Math.random() * maxRandom);
    return filteredRecommendations[random];
}

export {
    saveRecommendation,
    upvoteRecommendation,
    downvoteRecommendation,
    getRandomRecommendation,
};

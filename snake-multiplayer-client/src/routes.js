import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import InGame from './pages/InGame';

const Routes = () => {
	return (
		<BrowserRouter>
			<Route component={Home} path="/" exact />
			<Route component={InGame} path="/in-game" />
		</BrowserRouter>
	);
};

export default Routes;

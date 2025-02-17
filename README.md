# WindBorne Engineering Challenge
## Usage and Features
1. Displays all the data points from the API onto a world map, the API is fetched every 5 minutes. If there is any weird data corruption that I could not parse it defaults to the live API (00.json).
2. The search allows the user to find a location and then find the 5 closest balloons to that searched location. Overlayed ontop is a temperature gradient that was estimated by taking the temperatures from those 5 locations and creating a linear gradient amongst them. (This could be inaccurate)
3. Clicking on any of the balloon points will display a variety of weather data alongside giving the geolocation as a google plus code for easier search.
4. ToggleGroup to display historical data

## APIs Used
1. Google Maps API
2. Open weather API
3. Windborne Balloon Location API

## Future Improvements
1. Better data parsing --> Although I did a decent job, I think there is one case that I could have done better on.
2. Additional features built on top of the weather --> Humidity gradients, wind vectors, pressue etc etc
3. A Cleaner UI, although given the time spent I think it looks half decent. I tried to mimic one of Windborne's current applications.
4. Add a slider for the historical data so a user could query all the times 0-23h
5. Dynamically calculate the 5 closest points on change, this would require just a small rework of the current functionality.

## Bugs
1. If the historical time has an error on fetch, the toggle group does not update to the "live" button
2. Re-rendering the entire map every time I search --> no direct access to the Polyline API since I am accessing it via a google-react-maps package
3. Could have reduced the amount of state usage, but did so to increase dev speed.

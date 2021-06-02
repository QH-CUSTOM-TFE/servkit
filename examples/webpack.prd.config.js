// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
        const fullDir = path.join(__dirname, dir);
        const entry = path.join(fullDir, 'app.ts');
        if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
            entries[dir] = [entry];
        }

        return entries;
    }, {}),

    output: {
        path: path.join(__dirname, '../examples/__build__'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        publicPath: '/__build__/',
    },

    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
            { test: /\.css$/, use: ['css-loader'] },
            {
                test: /\.less$/,
                use: ['css-loader', 'less-loader'],
            },
            { test: /\.tsx?$/, exclude: /node_modules/, use: ['ts-loader'] },
        ],
    },

    resolve: {
        alias: {
            'servkit': path.resolve(__dirname, '../src/index.ts'),
        },
        extensions: ['.js', '.ts', '.d.ts', '.tsx', '.css'],
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    name: 'shared',
                    filename: 'shared.js',
                    chunks: 'initial',
                },
            },
        },
    },

    plugins: [
    ],
};


// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    mode: 'development',

    entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
        const fullDir = path.join(__dirname, dir);
        const entry = path.join(fullDir, 'index.ts');
        if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
            entries[dir] = ['webpack-hot-middleware/client', entry];
        }

        return entries;
    }, {}),

    output: {
        path: path.join(__dirname, '__build__'),
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        publicPath: '/__build__/',
    },

    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, use: ['cache-loader', 'babel-loader'] },
            { test: /\.css$/, use: [ 'cache-loader', 'style-loader', 'css-loader'] },
            {
                test: /\.less$/,
                use: ['cache-loader', 'style-loader', 'css-loader', 'less-loader'],
            },
            { test: /\.tsx?$/, exclude: /node_modules/, use: ['cache-loader', 'ts-loader'] },
        ],
    },
    /*externals: {
        'servkit': 'servkit',
    },*/
    resolve: {
        alias: {
            'servkit': path.resolve(__dirname, '../src'),
            '@example/first-example-decl': path.resolve(__dirname, 'packages/first-example-decl'),
            '@example/first-children-decl': path.resolve(__dirname, 'packages/first-children-decl'),
            '@example/first-example-parent-decl': path.resolve(__dirname, 'packages/first-example-parent-decl')
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

    plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
};

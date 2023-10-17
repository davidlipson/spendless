const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        background: path.resolve(__dirname, '..', 'src', 'background.ts'),
        content: path.resolve(__dirname, '..', 'src', 'content.ts'),
        dropdown: path.resolve(__dirname, '..', 'src', 'index.tsx'),
    },
    output: {
        path: path.join(__dirname, '../build'),
        filename: '[name].js',
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: 'public' }],
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
};

module.exports = {
  branches: [
    'master',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    'ci', // ci is the branch for workflow testing
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/changelog', {
      'changelogFile': 'doc/CHANGELOG.md'
    }],
    // Bump version of package.json
    ['@semantic-release/npm', {
      npmPublish: false,
    }],
    // Commit assets
    ['@semantic-release/git', {
      assets: [
        'package.json',
        'doc/CHANGELOG.md',
      ]
    }],
  ]
}

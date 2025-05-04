using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TheUnbaisedReport.Model;

namespace TheUnbaisedReport.Data
{
    public class MongoDBContext
    {
        private readonly IMongoDatabase _database;

        public MongoDBContext(IOptions<MongoDBSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<Report> Reports => _database.GetCollection<Report>("Reports");
    }

}

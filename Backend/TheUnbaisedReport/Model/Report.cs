using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;


namespace TheUnbaisedReport.Model
{
    public class Report
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("label")]
        public string Label { get; set; }

        [BsonElement("heading")]
        public string Heading { get; set; }  

        [BsonElement("summary")]
        public string Summary { get; set; }

        [BsonElement("date")]
        public string Date { get; set; }

        [BsonElement("time")]
        public string Time { get; set; }

        [BsonElement("place")]
        public string Place { get; set; }

        [BsonElement("context")]
        public string Context { get; set; }
    }
}

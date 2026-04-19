package sk.gemerbarbier.mapper;

import java.time.format.DateTimeFormatter;
import javax.annotation.processing.Generated;
import sk.gemerbarbier.entity.TimeSlot;
import sk.gemerbarbier.entity.TimeSlotStatus;
import sk.gemerbarbier.model.TimeSlotAdminResponseDto;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-07T12:42:22+0200",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24 (Oracle Corporation)"
)
public class TimeSlotMapperImpl implements TimeSlotMapper {

    @Override
    public TimeSlotAdminResponseDto toTimeSlotAdminResponseDto(TimeSlot timeSlot) {
        if ( timeSlot == null ) {
            return null;
        }

        TimeSlotAdminResponseDto timeSlotAdminResponseDto = new TimeSlotAdminResponseDto();

        if ( timeSlot.getId() != null ) {
            timeSlotAdminResponseDto.setId( timeSlot.getId().intValue() );
        }
        if ( timeSlot.getStartTime() != null ) {
            timeSlotAdminResponseDto.setStartTime( DateTimeFormatter.ISO_LOCAL_DATE_TIME.format( timeSlot.getStartTime() ) );
        }
        timeSlotAdminResponseDto.setStatus( timeSlotStatusToStatusEnum( timeSlot.getStatus() ) );

        return timeSlotAdminResponseDto;
    }

    protected TimeSlotAdminResponseDto.StatusEnum timeSlotStatusToStatusEnum(TimeSlotStatus timeSlotStatus) {
        if ( timeSlotStatus == null ) {
            return null;
        }

        TimeSlotAdminResponseDto.StatusEnum statusEnum;

        switch ( timeSlotStatus ) {
            case ACTIVE: statusEnum = TimeSlotAdminResponseDto.StatusEnum.ACTIVE;
            break;
            case RESERVED: statusEnum = TimeSlotAdminResponseDto.StatusEnum.RESERVED;
            break;
            case INACTIVE: statusEnum = TimeSlotAdminResponseDto.StatusEnum.INACTIVE;
            break;
            default: throw new IllegalArgumentException( "Unexpected enum constant: " + timeSlotStatus );
        }

        return statusEnum;
    }
}
